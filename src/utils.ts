import type { DBManager } from "./db";
import type { App, TFile } from "obsidian";

export const Log = (message: string) => {
  let print_log = true;
  if (print_log) console.log("[Map of Content] " + message);
};

export const RemoveExtension = (path: string, extension: string = ".md") => {
  if (path.endsWith(extension)) {
    return path.slice(0, -extension.length);
  }
  return path;
};

/**@returns True if CTRL / Meta is pressed */
export const IsCtrlPressed = (e: MouseEvent): boolean => {
  return window.navigator.userAgent.includes("Macintosh")
    ? e.metaKey
    : e.ctrlKey;
};

/**  Returns only the name of the actual file  */
export const FileNameFromPath = (path: string): string => {
  return path.split("/").last();
};

/**  return the full path if there are two or more notes with the same filename and extension, else only the filename  */
export const GetDisplayName = (path: string, db: DBManager): string => {
  let file_name = FileNameFromPath(path);
  let display_name = null;

  if (db.duplicate_file_status.get(file_name)) {
    display_name = RemoveExtension(path);
  } else {
    display_name = RemoveExtension(file_name);
  }
  return display_name;
};

export const NavigateToFile = async (
  app: App,
  path: string,
  event: MouseEvent
) => {
  let file = app.metadataCache.getFirstLinkpathDest(path, "/");

  if (!file) return;
  const leaf = IsCtrlPressed(event)
    ? app.workspace.splitActiveLeaf()
    : app.workspace.getUnpinnedLeaf();
  app.workspace.openLinkText(path, "/");
};

/** Get the paths of all folders in the vault, empty or not */
export const GetAllFolders = (app: App): string[] => {
  let vault_files = app.vault.getFiles();
  let all_folder_paths = [];
  vault_files.forEach((file) => {
    // cut of filename
    let folder_path = file.path.slice(
      0,
      file.path.length - (file.basename.length + file.extension.length + 1)
    );
    // add path to collected paths
    if (folder_path.length && !all_folder_paths.contains(folder_path)) {
      all_folder_paths.push(folder_path);
    }
  });

  // store all parent folder paths as unique paths if they aren't yet because they don't include any notes directly
  all_folder_paths.forEach((path) => {
    let all_sub_paths = path.split("/");
    for (let i = 1; i < all_sub_paths.length - 1; i++) {
      let partial_path = all_sub_paths.slice(0, i).join("/") + "/";
      if (!all_folder_paths.contains(partial_path)) {
        all_folder_paths.push(partial_path);
      }
    }
  });

  return all_folder_paths;
};
