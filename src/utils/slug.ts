// conversion d un titre en slug URL-safe en minuscules sans caracteres speciaux
const generateSlug = (title: string): string =>{
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
};
  
// generation d'un slug unique en ajoutant un suffixe numerique si necessaire
const generateUniqueSlug = (title: string, suffix?: number): string =>{
    const baseSlug = generateSlug(title);
    return suffix ? `${baseSlug}-${suffix}` : baseSlug;
};
  
export default { generateSlug, generateUniqueSlug };