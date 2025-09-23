const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/'/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
};
  
const generateUniqueSlug = (title: string, suffix?: number): string => {
    const baseSlug = generateSlug(title);
    return suffix ? `${baseSlug}-${suffix}` : baseSlug;
};
  
// normalisation d'un nom de tag : minuscules, sans espaces superflus
const normalizeTagName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, "-");
};
  
export default {
    generateSlug,
    generateUniqueSlug,
    normalizeTagName,
};