import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFile() {
  const filename = '6G Networks Resources.csv'
  
  console.log(`Looking for file: "${filename}"\n`)
  
  const files = await prisma.file.findMany({
    where: {
      filename: {
        contains: '6G'
      }
    },
    select: {
      id: true,
      filename: true,
      indexed: true,
      textContent: true,
      collectionId: true
    }
  })
  
  if (files.length === 0) {
    console.log('❌ No files found with "6G" in filename')
  } else {
    console.log(`✅ Found ${files.length} file(s):\n`)
    files.forEach((file, i) => {
      console.log(`${i + 1}. ${file.filename}`)
      console.log(`   ID: ${file.id}`)
      console.log(`   Collection: ${file.collectionId}`)
      console.log(`   Indexed: ${file.indexed}`)
      console.log(`   Text Content: ${file.textContent ? `${file.textContent.substring(0, 100)}...` : 'NULL'}`)
      console.log()
    })
  }
  
  await prisma.$disconnect()
}

checkFile()
