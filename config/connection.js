const Sequelize = require("sequelize");
require("dotenv").config();

let sequelize;

if (process.env.DATABASE_URL) {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: "postgres",
		protocol: "postgres",
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false, // Note: This is not ideal for production, as it disables SSL certificate verification.
			},
		},
	});
} else {
	sequelize = new Sequelize(
		process.env.DB_NAME,
		process.env.DB_USER,
		process.env.DB_PASSWORD,
		{
			host: "localhost",
			dialect: "mysql",
			port: 3306,
		}
	);
}

module.exports = sequelize;
