import { APP_CONFIG } from "./config.js";

export function loadProjects() {
  try { return JSON.parse(localStorage.getItem(APP_CONFIG.storageKey) || "[]"); }
  catch { return []; }
}

export function saveProjects(projects) {
  localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(projects));
}

export function upsertProject(project) {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) projects[index] = project;
  else projects.unshift(project);
  saveProjects(projects);
  return projects;
}

export function deleteProject(id) {
  const projects = loadProjects().filter(p => p.id !== id);
  saveProjects(projects);
  return projects;
}
