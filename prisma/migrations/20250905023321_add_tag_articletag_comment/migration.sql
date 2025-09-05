-- Migration : ajout des tables Tag, ArticleTag et Comment avec index sur authorId

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");
