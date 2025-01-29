CREATE DATABASE social_media;

USE social_media;

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_image VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    file_type ENUM('image', 'video') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
