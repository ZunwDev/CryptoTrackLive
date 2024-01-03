export function getChangeStatus(cryptoCode: string, newChange: number, previousChanges: Record<string, number>) {
  const previous = parseFloat(previousChanges[cryptoCode] as unknown as string);

  if (!isNaN(previous) && !isNaN(newChange)) {
    if (newChange > previous) {
      return "+";
    } else if (newChange < previous) {
      return "-";
    } else {
      return "/";
    }
  } else {
    return "?";
  }
}

export async function checkDataReadiness(dataArrays: any[], store: any): Promise<void> {
  return new Promise((resolve) => {
    const int = setInterval(() => {
      if (dataArrays.every((array) => Array.isArray(array) && array.length > 0)) {
        store.set({ isLoading: false });
        clearInterval(int);
        resolve();
      }
    }, 0);
  });
}
