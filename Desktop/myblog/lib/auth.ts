import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { authOptions as mainAuthOptions } from "@/app/api/auth/[...nextauth]/options"

const ADMIN_EMAILS = ['abcd901125@gmail.com']

export const authOptions = mainAuthOptions

