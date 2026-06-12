export const NATION_CODE: Record<string, string> = {
  Netherlands: "NED",
  England: "ENG",
  Germany: "GER",
  Brazil: "BRA",
  Argentina: "ARG",
  France: "FRA",
  Italy: "ITA",
  Spain: "ESP",
  Hungary: "HUN",
  Portugal: "POR",
};

export function nationCode(nation: string): string {
  return NATION_CODE[nation] ?? nation.slice(0, 3).toUpperCase();
}
