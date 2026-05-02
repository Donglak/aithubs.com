export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')                 // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')      // thay nhóm ký tự không phải a-z0-9 thành -
    .replace(/(^-|-$)+/g, '');        // bỏ - ở đầu/cuối