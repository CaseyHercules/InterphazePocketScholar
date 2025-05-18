export function toRomanNumeral(num: number): string {
  const romanNumerals = [
    { value: 20, numeral: "XX" },
    { value: 19, numeral: "XIX" },
    { value: 18, numeral: "XVIII" },
    { value: 17, numeral: "XVII" },
    { value: 16, numeral: "XVI" },
    { value: 15, numeral: "XV" },
    { value: 14, numeral: "XIV" },
    { value: 13, numeral: "XIII" },
    { value: 12, numeral: "XII" },
    { value: 11, numeral: "XI" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 8, numeral: "VIII" },
    { value: 7, numeral: "VII" },
    { value: 6, numeral: "VI" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 3, numeral: "III" },
    { value: 2, numeral: "II" },
    { value: 1, numeral: "I" },
  ];

  const numeral = romanNumerals.find((r) => r.value === num);
  return numeral ? numeral.numeral : num.toString();
}
