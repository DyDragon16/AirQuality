// In this file you can configure migrate-mongo

// Trong file này chúng ta sẽ đọc biến môi trường từ file .env
// Node >= 20.6.0 có thể sử dụng import cho dotenv, nếu không dùng require
require("dotenv").config();

// Cấu hình MongoDB
const config = {
	mongodb: {
		// Sử dụng biến môi trường cho URL MongoDB
		url: process.env.MONGODB_URI || "mongodb://localhost:27017",

		// Tên database
		databaseName: process.env.MONGODB_DB_NAME || "weather-app",

		options: {
			useNewUrlParser: true, // Bỏ cảnh báo khi kết nối
			useUnifiedTopology: true, // Sử dụng topo mới
			//   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
			//   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
		},
	},

	// The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
	migrationsDir: "migrations",

	// The mongodb collection where the applied changes are stored. Only edit this when really necessary.
	changelogCollectionName: "changelog",

	// The mongodb collection where the lock will be created.
	lockCollectionName: "changelog_lock",

	// The value in seconds for the TTL index that will be used for the lock. Value of 0 will disable the feature.
	lockTtl: 0,

	// The file extension to create migrations and search for in migration dir
	migrationFileExtension: ".js",

	// Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
	// if the file should be run.  Requires that scripts are coded to be run multiple times.
	useFileHash: false,

	// Don't change this, unless you know what you're doing
	moduleSystem: "commonjs",

	// CLI output
	cli: {
		migrationsDir: {
			withNumbering: true,
		},
	},
};

module.exports = config;
