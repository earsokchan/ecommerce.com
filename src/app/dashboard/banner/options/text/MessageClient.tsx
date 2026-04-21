"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../../../../components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { createMessage, deleteMessage, updateMessage, type Message } from "./actions";

interface MessageClientProps {
  initialMessages: Message[];
}

export function MessageClient({ initialMessages }: MessageClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddMessageOpen, setIsAddMessageOpen] = useState(false);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const resetForm = () => {
    setMessageText("");
    setEditMessageId(null);
    setError(null);
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setIsSubmitting(true);

      if (!messageText.trim()) {
        setError("Please enter a message");
        return;
      }

      const savedMessage = editMessageId
        ? await updateMessage(editMessageId, { message: messageText.trim() })
        : await createMessage({ message: messageText.trim() });

      if (editMessageId) {
        setMessages((prev) => prev.map((message) => (message._id === editMessageId ? savedMessage : message)));
        setSuccessMessage("Message updated successfully!");
      } else {
        setMessages((prev) => [...prev, savedMessage]);
        setSuccessMessage("Message created successfully!");
      }

      resetForm();
      setIsAddMessageOpen(false);
    } catch (err) {
      console.error("Error saving message:", err);
      setError(err instanceof Error ? err.message : "Failed to save message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMessage = (message: Message) => {
    setMessageText(message.message);
    setEditMessageId(message._id);
    setIsAddMessageOpen(true);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setError(null);
      await deleteMessage(id);
      setMessages((prev) => prev.filter((message) => message._id !== id));
      setSuccessMessage("Message deleted successfully!");
    } catch (err) {
      console.error("Error deleting message:", err);
      setError(err instanceof Error ? err.message : "Failed to delete message");
    }
  };

  const totalMessages = messages.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Messages</h1>
          <p className="text-gray-600">Manage banner messages efficiently</p>
          <p className="mt-2 text-sm text-gray-500">Total messages: {totalMessages}</p>
        </div>

        {successMessage && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-500 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 max-w-sm">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <p className="font-semibold">Success!</p>
                <p className="text-sm text-green-100">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-200 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Message List</h2>
            <Button
              onClick={() => {
                resetForm();
                setIsAddMessageOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add Message
            </Button>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No messages found</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddMessageOpen(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create First Message
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Message</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Message ID</th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message, idx) => (
                    <tr key={message._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{message.message}</p>
                      </td>

                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded border border-gray-300">
                          {message._id}
                        </code>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isAddMessageOpen} onOpenChange={setIsAddMessageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMessageId ? "Edit Message" : "Add New Message"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddMessage} className="space-y-4">
            <div>
              <Label htmlFor="messageText">Message *</Label>
              <Input
                id="messageText"
                placeholder="e.g., Summer Sale - 50% Off All Items"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddMessageOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!messageText.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {editMessageId ? "Updating..." : "Creating..."}
                  </>
                ) : editMessageId ? (
                  "✓ Update Message"
                ) : (
                  "✓ Create Message"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
