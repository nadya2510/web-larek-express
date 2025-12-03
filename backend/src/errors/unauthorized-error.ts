class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    // Обеспечиваем корректное имя класса в стеке вызовов
    this.name = this.constructor.name;
  }
}

export default UnauthorizedError;
