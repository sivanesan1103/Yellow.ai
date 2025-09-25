// Create initial user and database
db = db.getSiblingDB('yellowai');

// Create collections
db.createCollection('users');
db.createCollection('projects'); 
db.createCollection('chats');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { sparse: true });
db.projects.createIndex({ userId: 1 });
db.chats.createIndex({ userId: 1 });
db.chats.createIndex({ projectId: 1 });

print('Database initialized successfully!');