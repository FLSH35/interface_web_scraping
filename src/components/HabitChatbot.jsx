"use client";

import React, { useState } from "react";
import axios from "axios";

export default function HerokuBotDeployer() {
  const [herokuApiToken, setHerokuApiToken] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [polygonApiKey, setPolygonApiKey] = useState("");
  const [appName, setAppName] = useState("");
  const [status, setStatus] = useState("");
  const [deployedAppUrl, setDeployedAppUrl] = useState("");

  // Heroku API base URL
  const HEROKU_API = "https://api.heroku.com";
  const headers = {
    "Accept": "application/vnd.heroku+json; version=3",
    "Authorization": `Bearer ${herokuApiToken}`,
    "Content-Type": "application/json",
  };

  // Bot source code as a tarball (simplified; in practice, use a GitHub repo or local tarball)
  const BOT_FILES = {
    "bot.py": `PASTE_YOUR_BOT_PY_CONTENT_HERE`, // Replace with the bot.py content above
    "Procfile": "worker: python bot.py",
    "requirements.txt": "python-telegram-bot==20.6\npolygon-api-client==1.13.5\nasyncio",
    "runtime.txt": "python-3.11.6",
  };

  // Create a Heroku app
  const createHerokuApp = async () => {
    try {
      setStatus("Creating Heroku app...");
      const response = await axios.post(
        `${HEROKU_API}/apps`,
        { name: appName },
        { headers }
      );
      setDeployedAppUrl(`https://${response.data.name}.herokuapp.com`);
      return response.data.id;
    } catch (error) {
      setStatus(`Error creating app: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  // Set environment variables
  const setConfigVars = async (appId) => {
    try {
      setStatus("Setting config vars...");
      await axios.patch(
        `${HEROKU_API}/apps/${appId}/config-vars`,
        {
          TELEGRAM_BOT_TOKEN: telegramBotToken,
          POLYGON_API_KEY: polygonApiKey,
        },
        { headers }
      );
    } catch (error) {
      setStatus(`Error setting config vars: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  // Deploy the bot code (simplified; assumes a source tarball URL)
  const deployBot = async (appId) => {
    try {
      setStatus("Deploying bot...");
      // In a real app, you'd upload a tarball of BOT_FILES to a public URL or use Git.
      // For simplicity, assume a pre-hosted tarball URL (you’d need to host this yourself).
      const sourceBlobUrl = "https://example.com/bot.tar.gz"; // Replace with actual URL
      await axios.post(
        `${HEROKU_API}/apps/${appId}/builds`,
        { source_blob: { url: sourceBlobUrl } },
        { headers }
      );
      setStatus("Bot deployed successfully!");
    } catch (error) {
      setStatus(`Error deploying bot: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  // Scale the worker dyno
  const scaleWorker = async (appId) => {
    try {
      setStatus("Starting worker...");
      await axios.post(
        `${HEROKU_API}/apps/${appId}/formation`,
        { type: "worker", quantity: 1, size: "Free" },
        { headers }
      );
      setStatus("Bot is running on Heroku!");
    } catch (error) {
      setStatus(`Error scaling worker: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  };

  // Handle deployment
  const handleDeploy = async () => {
    if (!herokuApiToken || !telegramBotToken || !polygonApiKey || !appName) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const appId = await createHerokuApp();
      await setConfigVars(appId);
      await deployBot(appId);
      await scaleWorker(appId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Deploy Telegram Bot to Heroku</h1>

      <input
        type="text"
        placeholder="Heroku API Token"
        value={herokuApiToken}
        onChange={(e) => setHerokuApiToken(e.target.value)}
        className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Telegram Bot Token"
        value={telegramBotToken}
        onChange={(e) => setTelegramBotToken(e.target.value)}
        className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Polygon API Key"
        value={polygonApiKey}
        onChange={(e) => setPolygonApiKey(e.target.value)}
        className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Heroku App Name"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
        className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleDeploy}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Deploy Bot to Heroku
      </button>

      <p className="mt-4 text-sm text-gray-700">{status}</p>
      {deployedAppUrl && (
        <p className="mt-2 text-sm">
          App URL: <a href={deployedAppUrl} target="_blank" className="text-blue-600 underline">{deployedAppUrl}</a>
        </p>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Note: You need to provide a Heroku API token from your account settings. The bot code must be hosted as a tarball or in a Git repo (simplified here).
      </p>
    </div>
  );
}