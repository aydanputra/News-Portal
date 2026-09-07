import pkg from "../../package.json";

// Sumber tunggal versi CMS dari package.json. Bisa dioverride di runtime
// lewat env APP_VERSION / NEXT_PUBLIC_APP_VERSION bila diperlukan.
export const APP_VERSION: string = pkg.version;
