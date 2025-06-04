// Storage management
let notes = JSON.parse(localStorage.getItem("organizedNotes") || "[]");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadNotes();
  updateStats();

  // Load saved API key
  const savedApiKey = localStorage.getItem("apiKey");
  if (savedApiKey) {
    document.getElementById("apiKey").value = savedApiKey;
  }

  // Auto-save API key
  document.getElementById("apiKey").addEventListener("change", function () {
    localStorage.setItem("apiKey", this.value);
  });

  // Keyboard shortcuts
  document
    .getElementById("input")
    .addEventListener("keydown", function (event) {
      if (event.ctrlKey && event.key === "Enter") {
        organizeNotes();
      }
    });
});

function simulateAIOrganization(rawNotes) {
  // Enhanced demo mode that mimics AI analysis
  const lines = rawNotes.split("\n").filter((line) => line.trim());

  const analysis = {
    urgent: [],
    today: [],
    thisWeek: [],
    appointments: [],
    shopping: [],
    financial: [],
    personal: [],
    longTerm: [],
  };

  // AI-like analysis of each line
  lines.forEach((line) => {
    const cleanLine = line.replace(/^[-*•]\s*/, "").trim();
    if (!cleanLine) return;

    const lower = cleanLine.toLowerCase();

    // Time-based analysis
    const hasTimeIndicators = lower.match(
      /(today|tomorrow|asap|urgent|now|immediately)/
    );
    const hasThisWeek = lower.match(
      /(this week|by friday|end of week|before weekend)/
    );
    const hasAppointment = lower.match(
      /(meeting|appointment|call|at \d|pm|am)/
    );
    const hasShopping = lower.match(/(buy|groceries|store|shopping|purchase)/);
    const hasFinancial = lower.match(/(pay|bill|bank|money|cost|\$)/);
    const hasPersonal = lower.match(
      /(birthday|family|friend|mom|dad|anniversary)/
    );

    // Intelligent categorization
    if (
      lower.includes("urgent") ||
      lower.includes("asap") ||
      lower.includes("emergency")
    ) {
      analysis.urgent.push(`⚡ ${cleanLine}`);
    } else if (hasTimeIndicators || lower.includes("today")) {
      analysis.today.push(`🎯 ${cleanLine}`);
    } else if (hasThisWeek) {
      analysis.thisWeek.push(`📅 ${cleanLine}`);
    } else if (hasAppointment) {
      analysis.appointments.push(`🤝 ${cleanLine}`);
    } else if (hasShopping) {
      analysis.shopping.push(`🛒 ${cleanLine}`);
    } else if (hasFinancial) {
      analysis.financial.push(`💰 ${cleanLine}`);
    } else if (hasPersonal) {
      analysis.personal.push(`❤️ ${cleanLine}`);
    } else {
      analysis.longTerm.push(`📝 ${cleanLine}`);
    }
  });

  let html =
    '<div style="text-align: center; margin-bottom: 20px;"><h2 style="color: #667eea;">🧠 AI-Analyzed & Organized Notes</h2></div>';

  // Priority-based ordering
  const categories = [
    {
      key: "urgent",
      title: "🚨 Urgent - Do Immediately",
      color: "#ff4757",
    },
    { key: "today", title: "🎯 Today's Priorities", color: "#ff6b6b" },
    { key: "thisWeek", title: "📊 This Week's Goals", color: "#ffa502" },
    {
      key: "appointments",
      title: "📅 Scheduled Items",
      color: "#3742fa",
    },
    { key: "financial", title: "💰 Financial Tasks", color: "#2ed573" },
    {
      key: "shopping",
      title: "🛒 Shopping & Purchases",
      color: "#ff6348",
    },
    { key: "personal", title: "👥 Personal & Social", color: "#a4b0be" },
    { key: "longTerm", title: "📝 General Tasks", color: "#57606f" },
  ];

  categories.forEach((category) => {
    if (analysis[category.key].length > 0) {
      html += `<h2 style="color: ${category.color};">${category.title}</h2><ul>`;
      analysis[category.key].forEach((item) => {
        html += `<li>${item}</li>`;
      });
      html += "</ul>";
    }
  });

  // Add AI-like insights
  const totalTasks = Object.values(analysis).flat().length;
  const urgentCount = analysis.urgent.length + analysis.today.length;

  html += `<div style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea;">
          <h2 style="color: #667eea;">📊 AI Insights</h2>
          <ul>
            <li>📈 Total items analyzed: ${totalTasks}</li>
            <li>⚡ High priority items: ${urgentCount}</li>
            <li>💡 Recommendation: ${
              urgentCount > 0
                ? "Focus on urgent items first!"
                : "Great job staying organized!"
            }</li>
          </ul>
        </div>`;

  return html;
}

async function organizeNotes() {
  const userInput = document.getElementById("input").value.trim();
  const apiKey = document.getElementById("apiKey").value.trim();
  const button = document.querySelector("button");

  if (!userInput) {
    showToast("Please enter some notes to organize!", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "🔄 Organizing...";

  // Show loading state
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.innerHTML = "🧠 AI is organizing your thoughts...";
  document.getElementById("notesContainer").appendChild(loadingDiv);

  try {
    let organizedContent;
    let processingMethod = "Demo Mode";

    if (!apiKey) {
      // Demo mode
      await new Promise((resolve) => setTimeout(resolve, 1500));
      organizedContent = simulateAIOrganization(userInput);
    } else {
      // Real API call
      processingMethod = "AI-Powered";
      const prompt = `You are an intelligent note organization AI. Analyze the following cluttered text and create well-organized, actionable notes.

ANALYSIS INSTRUCTIONS:
1. Read and understand the context and relationships between different items
2. Identify priorities, urgency levels, and dependencies
3. Group related items intelligently based on context, not just keywords
4. Create meaningful categories that make sense for the user's situation
5. Add time-sensitive items to priority sections
6. Suggest actionable steps where appropriate
7. Use clear, concise language

FORMAT REQUIREMENTS:
- Use HTML with h2 tags for categories and ul/li tags for items
- Add relevant emojis for visual appeal
- Order categories by importance/urgency
- Include time estimates or deadlines where mentioned
- Make items actionable (start with verbs when possible)

CLUTTERED INPUT TO ANALYZE:
${userInput}

Return only clean HTML content with intelligently organized categories and actionable items.`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
            temperature: 0.3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      organizedContent = result.choices?.[0]?.message?.content;

      if (!organizedContent) {
        throw new Error("No content received from API");
      }

      // Clean up the response
      organizedContent = organizedContent
        .replace(/```html\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/`/g, "")
        .trim();
    }

    // Create new note
    const newNote = {
      id: Date.now(),
      title: generateNoteTitle(userInput),
      content: organizedContent,
      rawInput: userInput,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      method: processingMethod,
    };

    // Add to notes array and save
    notes.unshift(newNote);
    saveNotes();
    loadNotes();
    updateStats();

    // Clear input
    document.getElementById("input").value = "";

    showToast(`✨ Note organized successfully with ${processingMethod}!`);
  } catch (error) {
    console.error("Error:", error);
    showToast(`Error: ${error.message}`, "error");
  } finally {
    button.disabled = false;
    button.textContent = "✨ Organize My Thoughts";

    // Remove loading div
    const loadingDiv = document.querySelector(".loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }
}

function generateNoteTitle(input) {
  const lines = input.split("\n").filter((line) => line.trim());
  const firstLine =
    lines[0]?.trim().replace(/^[-*•]\s*/, "") || "Untitled Note";
  return firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
}

function saveNotes() {
  localStorage.setItem("organizedNotes", JSON.stringify(notes));
}

function loadNotes() {
  const notesGrid = document.getElementById("notesGrid");
  const emptyState = document.getElementById("emptyState");

  if (notes.length === 0) {
    emptyState.style.display = "block";
    notesGrid.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";

  notesGrid.innerHTML = notes
    .map(
      (note) => `
          <div class="note-card" data-id="${note.id}">
            <div class="note-actions">
              <button class="action-btn edit-btn" onclick="editNote(${note.id})" title="Edit">✏️</button>
              <button class="action-btn copy-btn" onclick="copyNote(${note.id})" title="Copy">📋</button>
              <button class="action-btn delete-btn" onclick="deleteNote(${note.id})" title="Delete">🗑️</button>
            </div>
            
            <div class="note-header">
              <div class="note-title">
                <span>📝</span>
                <span>${note.title}</span>
              </div>
              <div class="note-date">${note.date}</div>
            </div>
            
            <div class="note-content">
              ${note.content}
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f0f0f0; font-size: 0.9rem; color: #666; display: flex; justify-content: space-between; align-items: center;">
              <span>💡 ${note.method}</span>
              <span>🕒 ${note.time}</span>
            </div>
          </div>
        `
    )
    .join("");
}

function updateStats() {
  document.getElementById(
    "noteCount"
  ).textContent = `${notes.length} notes saved`;
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    notes = notes.filter((note) => note.id !== id);
    saveNotes();
    loadNotes();
    updateStats();
    showToast("Note deleted successfully!");
  }
}

function copyNote(id) {
  const note = notes.find((n) => n.id === id);
  if (note) {
    // Create a clean text version
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = note.content;
    const cleanText = tempDiv.textContent || tempDiv.innerText;

    navigator.clipboard
      .writeText(cleanText)
      .then(() => {
        showToast("Note copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy note", "error");
      });
  }
}

function editNote(id) {
  const note = notes.find((n) => n.id === id);
  if (note) {
    document.getElementById("input").value = note.rawInput;
    document.getElementById("input").focus();
    showToast("Note loaded for editing!");
  }
}

function clearInput() {
  document.getElementById("input").value = "";
  showToast("Input cleared!");
}

function clearAllNotes() {
  if (
    confirm("Are you sure you want to delete all notes? This cannot be undone.")
  ) {
    notes = [];
    saveNotes();
    loadNotes();
    updateStats();
    showToast("All notes cleared!");
  }
}

function showToast(message, type = "success") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;

  if (type === "error") {
    toast.style.background = "#dc3545";
  }

  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add("show"), 100);

  // Hide toast
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add clear all button to stats bar
document.getElementById("statsBar").innerHTML += `
        <button onclick="clearAllNotes()" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 8px 15px; font-size: 14px; border-radius: 20px;">
          🗑️ Clear All
        </button>
      `;
