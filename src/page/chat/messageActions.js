import Cookies from "js-cookie";
import api from "../../utils/api";

// ✏️ Edit message
export async function handleEditMessage(messageId, newContent, setMessages, setEditingMessage, setEditText) {
  try {
    const response = await api.put(
      `chatting/${messageId}/edit/`,
      { content: newContent },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": Cookies.get("csrftoken"),
        },
      }
    );

    if (response.data && response.data.id) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, message: newContent, is_edited: true }
            : msg
        )
      );
      setEditingMessage(null);
      setEditText("");
      return true;
    }
  } catch (error) {
    console.error("Failed to edit message:", error);
    console.error("Response data:", error.response?.data);

    // 🔄 Fallback to POST if PUT fails
    try {
      const postResponse = await api.post(
        `chatting/${messageId}/edit/`,
        { content: newContent },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": Cookies.get("csrftoken"),
          },
        }
      );

      if (postResponse.data && postResponse.data.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, message: newContent, is_edited: true }
              : msg
          )
        );
        setEditingMessage(null);
        setEditText("");
        return true;
      }
    } catch (postError) {
      console.error("POST fallback also failed:", postError);
      alert("Failed to edit message. Check console for details.");
    }
  }
  return false;
}

// 🗑️ Delete message
export async function handleDeleteMessage(messageId, setMessages, setShowMessageMenu) {
  if (!confirm("Are you sure you want to delete this message?")) return;

  try {
    const response = await api.delete(`chatting/${messageId}/delete/`, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": Cookies.get("csrftoken"),
      },
    });

    if (response.data.success) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      setShowMessageMenu(null);
    }
  } catch (error) {
    console.error("Failed to delete message:", error);
    console.error("Response data:", error.response?.data);
    alert("Failed to delete message. Check console for details.");
  }
}
