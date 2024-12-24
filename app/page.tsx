import { createClient } from "@/app/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("sudoku_puzzle").select();
  console.log(data);
  return <h1>Hello, Next.js!</h1>;
}