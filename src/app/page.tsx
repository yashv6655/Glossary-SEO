import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Github, Search, Zap } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Github className="h-6 w-6" />,
      title: "GitHub Integration",
      description: "Connect any public repository and automatically scan documentation files"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Extraction",
      description: "Uses Claude AI to intelligently identify and define technical terms"
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Searchable Glossaries",
      description: "Beautiful, fast, and SEO-friendly glossary pages for easy discovery"
    }
  ]

  const exampleTerms = [
    { term: "React Hook", definition: "A special function that lets you use state and other React features in functional components.", tags: ["React", "Frontend"] },
    { term: "Middleware", definition: "Software that sits between different applications or services to facilitate communication and data management.", tags: ["Backend", "Architecture"] },
    { term: "TypeScript", definition: "A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.", tags: ["Language", "Types"] },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Turn your GitHub repos into 
              <span className="text-primary-600"> beautiful glossaries</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Automatically extract technical terms from your documentation and create searchable, 
              SEO-friendly glossaries that help your team and users understand your codebase.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/import">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#example">View Example</Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Free to use</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>No signup required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>AI-powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your repository into a comprehensive glossary
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example Glossary */}
      <section id="example" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              See it in action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here's what a generated glossary looks like from a typical React project
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">React Project Glossary</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Github className="h-4 w-4" />
                  <span>facebook/react</span>
                  <Badge variant="secondary">24 terms</Badge>
                </div>
              </div>
              
              <div className="grid gap-4">
                {exampleTerms.map((term, index) => (
                  <Card key={index} className="border-gray-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{term.term}</CardTitle>
                        <div className="flex space-x-1">
                          {term.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {term.definition}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
              Ready to create your first glossary?
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
              Start by importing a GitHub repository and see how DevGlossary can help 
              your team understand complex codebases faster.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/import">
                Create Your Glossary
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}