export function solveGaussJordan(A: number[][], b: number[]): number[] {
    const n = A.length;
    for (let i = 0; i < n; i++) {
        // Find pivot
        let max = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
        }
        
        // Swap rows in A and b
        const tempA = A[i]; A[i] = A[max]; A[max] = tempA;
        const tempB = b[i]; b[i] = b[max]; b[max] = tempB;

        const pivot = A[i][i];
        if (Math.abs(pivot) < 1e-12) continue; // Skip singular

        // Normalize pivot row
        for (let j = i; j < n; j++) A[i][j] /= pivot;
        b[i] /= pivot;

        // Eliminate column for other rows
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const factor = A[j][i];
                for (let k = i; k < n; k++) A[j][k] -= factor * A[i][k];
                b[j] -= factor * b[i];
            }
        }
    }
    return b;
}
