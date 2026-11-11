import { revalidateTag } from "next/cache";

export function revalidatePortfolio() {
  revalidateTag("portfolio");
  revalidateTag("site-accents");
}
