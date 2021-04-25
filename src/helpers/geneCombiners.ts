export default class GeneCombinators {
    public static crossoverAlternating<TItem>(g1: TItem[], g2: TItem[]): TItem[]  {
        const result: TItem[] = [];
        g1.forEach((item, index) => {
            result[index] = index % 2 === 0 ? item : g2[index];
        });
        return result;
    }
}