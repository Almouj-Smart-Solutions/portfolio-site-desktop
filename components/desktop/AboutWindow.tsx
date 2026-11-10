import styles from "./AboutWindow.module.css";

export default function AboutWindow({ html }: { html: string }) {
  return <div className={styles.aboutContainer} dangerouslySetInnerHTML={{ __html: html }} />;
}
