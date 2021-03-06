var markdown = require('markdown-it')
var mdnh = require('markdown-it-named-headers')
var md = markdown({ html: true }).use(mdnh)

module.exports = {
  method: 'get',
  endpoint: '/projects/:projectId',
  middleware: [],
  controller: getProjectsID
}

function getProjectsID (req, res) {
  var Projects = req.models.Projects
  let projectLead
  if (req.user && req.user.teams && req.user.teams.lead && req.user.teams.lead.includes(req.params.projectId)) projectLead = true
  Projects.findOne({
    id: req.params.projectId
  }, function (err, foundProject) {
    if (err) console.error(err)
    if (foundProject === null) {
      req.flash('errors', {msg: `Unable to find project with id ${req.params.projectId}`})
      res.redirect('/projects/')
      return
    }
    foundProject.repositories = foundProject.repositories || []
    foundProject.content = md.render(foundProject.content)
    if (foundProject.contact.length) {
      Projects.fetchGithubUsers(foundProject.contact, function (contactList) {
        res.render(res.theme.public + '/views/projects/project', {
          view: 'project',
          projectId: req.params.projectId,
          title: foundProject.name,
          brigade: res.locals.brigade,
          project: foundProject,
          contacts: contactList,
          projectLead
        })
      })
    } else {
      res.render(res.theme.public + '/views/projects/project', {
        view: 'project',
        projectId: req.params.projectId,
        title: foundProject.name,
        brigade: res.locals.brigade,
        project: foundProject,
        contacts: [],
        projectLead
      })
    }
  })
}
