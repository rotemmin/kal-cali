import styles from "./page.module.css";
import Header from "@/components/general/Header";
import ClientDictionary from "./ClientDictionary";
import { promises as fs } from 'fs';
import path from 'path';

async function getDictionaryData() {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'content', 'dictionary.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents);
  return data.dictionary.sort((a: { title: string }, b: { title: string }) =>
    a.title.localeCompare(b.title, "he", { sensitivity: "base" })
  );
}

export default async function DictionaryPage() {
  const dictionaryData = await getDictionaryData();

  return (
    <>
      <Header />
      <div className={styles.mainContainer}>
        <ClientDictionary initialData={dictionaryData} />
      </div>
    </>
  );
}
