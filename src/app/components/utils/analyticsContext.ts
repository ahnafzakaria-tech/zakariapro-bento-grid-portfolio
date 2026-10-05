export function setLastProject(name: string) {
  sessionStorage.setItem("lastProject", name);
}

export function getLastProject() {
  return sessionStorage.getItem("lastProject");
}
