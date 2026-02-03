# MongoDB Setup Guide for Windows

Since you don't have MongoDB installed, follow these steps to set it up on your machine.

## 1. Download MongoDB Community Server
1. Go to the [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Select the following options:
   - **Version**: (Latest current version, e.g., 7.0.x or 8.0.x)
   - **Platform**: Windows x64
   - **Package**: MSI
3. Click **Download**.

## 2. Install MongoDB
1. Run the downloaded `.msi` file.
2. Click **Next** until you reach the "Choose Setup Type" screen.
3. Click **Complete**.
4. **Important**: On the "Service Configuration" screen:
   - Check **"Install MongoDB as a Service"**.
   - Keep "Run service as Network Service user" selected.
   - Service Name: `MongoDB`
   - Data Directory: (Keep default)
   - Log Directory: (Keep default)
5. Click **Next**.
6. **Optional**: "Install MongoDB Compass" is usually checked. It's a great GUI for viewing your data. We recommend keeping it checked.
7. Click **Install**.

## 3. Verify Installation
Once installed, MongoDB should be running automatically as a Windows Service.

1. Open your browser or MongoDB Compass.
2. Connect to: `mongodb://localhost:27017`
3. If it connects successfully, you are ready!

## 4. Connect Your Application
Your `server/.env` file is already configured correctly:
```env
MONGO_URI=mongodb://localhost:27017/hacksphere
```

## Troubleshooting
If you need to use the command line tools (like `mongod` or `mongo`/`mongosh`) and they aren't found:
1. Find where MongoDB was installed (usually `C:\Program Files\MongoDB\Server\<version>\bin`).
2. Add this path to your System Environment Variables "Path".
   - Search "Edit the system environment variables" in Windows Start.
   - Click "Environment Variables".
   - Under "System variables", find "Path" and click "Edit".
   - Click "New" and paste the path to the `bin` folder.
   - Click OK to save.
3. Restart your terminal (VS Code).
