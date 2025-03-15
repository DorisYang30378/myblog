ALTER TABLE User ADD COLUMN isAdmin BOOLEAN DEFAULT false;
UPDATE User SET isAdmin = true WHERE email = 'abcd901125@gmail.com'; 