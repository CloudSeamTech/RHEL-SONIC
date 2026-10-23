CREATE TABLE `learner_activity` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`visited_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `learner_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learner_progress` (
	`user_id` text NOT NULL,
	`progress_key` text NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `progress_key`)
);
