import express, { Application } from 'express'

export function makeExpress(): Application {
  return express().use(express.json())
}
