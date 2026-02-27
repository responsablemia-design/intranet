declare global {
  namespace App {
    interface Locals {
      user: {
        id: string
        email: string
        name: string
        avatar: string | null
        role: 'ADMIN' | 'PROFESOR' | 'ALUMNO'
      } | null
    }
  }
}

export {}
