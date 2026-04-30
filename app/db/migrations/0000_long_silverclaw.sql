-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `login` (
	`userID` text NOT NULL,
	`pass` text NOT NULL,
	`accept` int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `techlist` (
	`ProjectID` int(11) NOT NULL,
	`ProjectName` text DEFAULT 'NULL',
	`TechName` text DEFAULT 'NULL',
	`URL` text DEFAULT 'NULL',
	`CreateDate` date NOT NULL DEFAULT '''2019-01-01''',
	`Repository` text DEFAULT 'NULL'
);

*/