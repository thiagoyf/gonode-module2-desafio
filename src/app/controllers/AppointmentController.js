const { User, Appointment } = require('../models')
const moment = require('moment')

class AppointmentController {
  async create (req, res) {
    const provider = await User.findByPk(req.params.provider)

    return res.render('appointments/create', { provider })
  }

  async store (req, res) {
    const { id } = req.session.user
    const { provider } = req.params
    const { date } = req.body

    await Appointment.create({
      user_id: id,
      provider_id: provider,
      date
    })

    return res.redirect('/app/dashboard')
  }

  async list (req, res) {
    const { user } = req.session

    if (user.provider) {
      const appointments = []

      await Appointment.findAll({
        where: {
          provider_id: user.id
        },
        order: ['date']
      }).map(async a => {
        const { name, avatar } = await User.findByPk(a.user_id)
        appointments.push({
          date: moment(a.date).format('DD/MM/YYYY hh:mm:ss'),
          person: { name, avatar }
        })
      })

      return res.render('appointments/list', { appointments })
    }

    const appointments = []

    await Appointment.findAll({
      where: {
        user_id: user.id
      },
      order: [['date', 'ASC']]
    }).map(async a => {
      const { name, avatar } = await User.findByPk(a.provider_id)
      appointments.push({
        date: moment(a.date).format('DD/MM/YYYY hh:mm:ss'),
        person: { name, avatar }
      })
    })

    return res.render('appointments/list', { appointments })
  }
}

module.exports = new AppointmentController()
