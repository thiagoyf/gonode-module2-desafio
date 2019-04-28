const { User, Appointment } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')

class ScheduleController {
  async index (req, res) {
    const { user } = req.session

    if (user.provider) {
      const appointments = await Appointment.findAll({
        include: [{ model: User, as: 'user' }],
        where: {
          provider_id: user.id,
          date: {
            [Op.between]: [
              moment()
                .startOf('day')
                .format(),
              moment()
                .endOf('day')
                .format()
            ]
          }
        },
        order: [['date']]
      }).map(a => {
        a.hour = moment(a.date).format('hh:mm')
        return a
      })

      console.log(JSON.stringify(appointments))

      return res.render('schedule/provider', { appointments })
    }

    const appointments = await Appointment.findAll({
      include: [{ model: User, as: 'provider' }],
      where: {
        user_id: user.id,
        date: {
          [Op.between]: [
            moment()
              .startOf('day')
              .format(),
            moment()
              .endOf('day')
              .format()
          ]
        }
      },
      order: [['date']]
    }).map(a => {
      a.hour = moment(a.date).format('hh:mm')
      return a
    })

    console.log(JSON.stringify(appointments))

    return res.render('schedule/customer', { appointments })
  }
}

module.exports = new ScheduleController()
