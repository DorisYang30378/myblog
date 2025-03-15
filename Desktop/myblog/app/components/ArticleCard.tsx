import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"

interface ArticleCardProps {
  title: string
  content: string
  category: string
  createdAt: string
}

export default function ArticleCard({ title, content, category, createdAt }: ArticleCardProps) {
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`${action} clicked`)
  }

  return (
    <Link href={`/articles/${title}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="text-sm text-gray-500 mb-2">{category}</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 line-clamp-3">{content}</p>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              {new Date(createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, 'like')}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, 'comment')}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, 'bookmark')}>
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => handleAction(e, 'share')}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
