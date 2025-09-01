class AppError extends Error {
    // Classe d erreur personnalisee pour distinguer les erreurs operationnelles des erreurs systeme
    public readonly statusCode: number;
    public readonly isOperational: boolean;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
}
  
export default AppError;