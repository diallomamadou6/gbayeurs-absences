const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Fake lucide to prevent errors
window.lucide = { createIcons: () => {} };

// Inject App code
const scriptContent = fs.readFileSync('js/app.js', 'utf8');
const scriptEl = window.document.createElement("script");
scriptEl.textContent = scriptContent;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
    console.log("Initial active nav:");
    window.document.querySelectorAll('.nav-link').forEach(l => {
        if (l.classList.contains('active')) console.log("Active: " + l.getAttribute('data-module'));
    });

    // Simulate clicking the "Faire l'appel" button
    console.log("\nClicking button...");
    const btn = window.document.querySelector('button[onclick="App.loadModule(\'saisie\')"]');
    if (btn) btn.click();
    else console.log("Button not found!");

    console.log("\nActive nav after click:");
    window.document.querySelectorAll('.nav-link').forEach(l => {
        if (l.classList.contains('active')) console.log("Active: " + l.getAttribute('data-module'));
    });
}, 1000);
