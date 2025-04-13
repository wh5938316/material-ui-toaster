import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  staticImage: true
})

// You can include other Next.js configuration options here, in addition to Nextra settings:
export default withNextra({
  reactStrictMode: true,
})
