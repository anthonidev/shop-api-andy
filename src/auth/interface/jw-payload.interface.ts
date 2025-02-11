export interface JwtPayload {
  id: string; // Cambiado a string ya que el ID es UUID
  iat?: number;
  exp?: number;
}
