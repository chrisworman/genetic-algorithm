export default interface IGene {
    deserialize: (serialized: string) => IGene;
    serialize: () => string;
}
