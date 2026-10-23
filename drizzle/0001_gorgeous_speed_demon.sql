ALTER TABLE `learner_profiles` ADD `email` text;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `subscription_tier` text DEFAULT 'free' NOT NULL;