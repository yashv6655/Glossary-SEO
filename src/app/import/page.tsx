import { ImportForm } from '@/components/forms/ImportForm'

export default function ImportPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Import from GitHub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a GitHub repository to automatically extract technical terms 
            from documentation and create a searchable glossary.
          </p>
        </div>

        <ImportForm />
        
        <div className="mt-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How the import process works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-3">
                1
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Scan Repository</h3>
              <p className="text-sm text-gray-600">
                We analyze your README, docs folder, and markdown files
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-3">
                2
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Extract Terms</h3>
              <p className="text-sm text-gray-600">
                AI identifies technical terms and generates clear definitions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mx-auto mb-3">
                3
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Create Glossary</h3>
              <p className="text-sm text-gray-600">
                Get a beautiful, searchable glossary ready to share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}