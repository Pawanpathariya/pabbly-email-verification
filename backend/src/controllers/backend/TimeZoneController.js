const Response = require('../../utils/response-util')
const ct = require('countries-and-timezones');
const User = require('../../models/User');
const { getGmtOffset } = require('../../utils/timezone-util');
const Logs = require('../../utils/logs-util.js');

module.exports = {
    /**
     * Get The list Of The timezone by country
     * @param {*} req 
     * @param {*} res 
     */
    getTimezonesByCountry: (req, res) => {
        try {
            const countries = ct.getAllCountries();
            const formattedTimezones = [];

            for (const countryCode in countries) {
                const country = countries[countryCode];

                country.timezones.forEach((timezone) => {
                    const gmtOffset = getGmtOffset(timezone);
                    formattedTimezones.push({ key: timezone, value: gmtOffset });
                });
            }
            res.status(200).json(Response.success("Timezones fetched successfully", formattedTimezones));
        } catch (error) {
            Logs.error("Error in fetching timezones: ", error);
        }

    },

    /**
     * Save The Timezone into user account
     * @param {*} req 
     * @param {*} res 
     */
    saveTimeZone: async (req, res) => {
        try {
            const userId = req.user.id;
            const { timezone } = req.body;

            if (!timezone) {
                return res.status(400).json(Response.error('timezone are required'));
            }

            const gmtOffset = getGmtOffset(timezone);
            if (!gmtOffset) {
                return res.status(400).json(Response.error('Invalid timezone'));
            }
            const timezoneData = {
                key: timezone,
                value: gmtOffset,
            };
            await User.findOneAndUpdate(
                { user_id: userId },
                { timezone: timezoneData },
            );

            return res.status(200).json(Response.success('Timezone saved successfully', { timezone, gmtOffset }));
        } catch (error) {
            Logs.error("Error in saving timezone: ", error);
            return res.status(500).json(Response.error("Error while saving timezone", error));
        }

    },


    /**
     * Get The User Timezone
     * @param {*} req 
     * @param {*} res
     */
    getUserTimezone: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findOne({user_id:userId});
            if (!user) {
                return res.status(404).json(Response.error('User not found'));
            }
            
            const { timezone } = user;
            return res.status(200).json(Response.success('User timezone fetched successfully', { timezone }));
        } catch (error) {
            Logs.error("Error in fetching user timezone: ", error);
            return res.status(500).json(Response.error("Error while fetching user timezone", error));
        }
    }
}

