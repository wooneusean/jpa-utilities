export const capitalize = (input: string): string => input.charAt(0).toUpperCase() + input.slice(1);

export const toCamelCase = (input: string): string => {
    return input.split('_').reduce((prev, curr, ix) => {
        if (ix == 0) {
            return prev + curr.toLowerCase();
        } else {
            return prev + capitalize(curr.toLowerCase());
        }
    }, '');
};
