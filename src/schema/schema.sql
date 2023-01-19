CREATE TABLE Startup (
    id INT NOT NULL AUTO_INCREMENT,
    name CHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Phase (
    id INT NOT NULL AUTO_INCREMENT,
    title CHAR(50) NOT NULL,
    description VARCHAR(255),
    seqNo INT NOT NULL,
    locked BIT,
    isComplete BIT,
    PRIMARY KEY (id),
    CONSTRAINT FK_Startup FOREIGN KEY (startupId) REFERENCES Startup(id)
);

CREATE TABLE Task (
    id INT NOT NULL AUTO_INCREMENT,
    title CHAR(50) NOT NULL,
    description VARCHAR(255),
    isComplete BIT,    
    PRIMARY KEY (id),
    CONSTRAINT FK_Phase FOREIGN KEY (phaseId) REFERENCES Phase(id)
);