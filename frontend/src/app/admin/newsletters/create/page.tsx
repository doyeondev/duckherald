"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  FileText,
  Save,
  ArrowLeft,
  Eye,
  Code,
  Quote,
  Loader2,
} from "lucide-react";

// shadcn UI 컴포넌트들
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateNewsletter = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [thumbnailImg, setThumbnailImg] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [summary, setSummary] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // TipTap 에디터 설정
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        allowBase64: true,
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Blockquote,
      CodeBlock,
      Youtube.configure({
        controls: true,
        width: 640,
        height: 360,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "<p>뉴스레터 내용을 입력하세요...</p>",
  });

  // 이미지 리사이징 함수
  const resizeImage = (
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // 이미지가 최대 크기보다 크면 비율을 유지하며 크기 조정
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // 캔버스를 Blob으로 변환
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas to Blob conversion failed"));
                return;
              }

              // Blob을 File로 변환
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              resolve(resizedFile);
            },
            "image/jpeg",
            0.85,
          ); // 품질 85%의 JPEG로 압축
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 썸네일 업로드 핸들러 수정 - 이미지를 선택하면 바로 R2에 업로드
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 이미지 리사이징
      const resizedImage = await resizeImage(file, 800, 800);
      setThumbnailImg(resizedImage);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(resizedImage);

      // R2에 이미지 업로드
      const formData = new FormData();
      formData.append("file", resizedImage);
      formData.append("type", "thumbnail");

      const response = await axios.post(
        "http://localhost:8080/api/newsletters/images/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      // 반환된 URL 저장
      setThumbnailUrl(response.data);
      console.log("이미지 업로드 성공, URL:", response.data);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      setError("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  // 본문 이미지 업로드 핸들러 추가
  const uploadBodyImage = async (file: File) => {
    try {
      // 이미지 리사이징
      const resizedImage = await resizeImage(file, 1200, 1200);

      // R2에 이미지 업로드
      const formData = new FormData();
      formData.append("file", resizedImage);
      formData.append("type", "body");

      const response = await axios.post(
        "http://localhost:8080/api/newsletters/images/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return response.data; // 이미지 URL 반환
    } catch (error) {
      console.error("본문 이미지 업로드 실패:", error);
      throw new Error("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  // 이미지 삽입 핸들러 수정 - URL 직접 입력 또는 파일 업로드 옵션 추가
  const insertImage = useCallback(() => {
    // 파일 선택 input 요소 생성
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          // 로딩 표시 (선택적)
          // ...

          // 이미지 업로드 및 URL 받기
          const imageUrl = await uploadBodyImage(file);

          // 에디터에 이미지 삽입
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error("이미지 삽입 실패:", error);
          alert("이미지 업로드 중 오류가 발생했습니다.");
        }
      }
    };
    input.click();
  }, [editor]);

  // 링크 삽입 핸들러
  const insertLink = useCallback(() => {
    const url = window.prompt("링크 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // YouTube 삽입 핸들러
  const insertYoutube = useCallback(() => {
    const url = window.prompt("YouTube 영상 URL을 입력하세요:");
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  // 미리보기 모드 핸들러
  const handlePreviewMode = useCallback(() => {
    setActiveTab("preview");
    if (previewRef.current && editor) {
      const content = editor.getHTML();
      previewRef.current.innerHTML = content;
    }
  }, [editor, setActiveTab]);

  // 통합된 저장 핸들러
  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    if (
      !isDraft &&
      (!editor?.getHTML() ||
        editor.getHTML() === "<p>뉴스레터 내용을 입력하세요...</p>")
    ) {
      setError("발행할 뉴스레터의 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const jsonData = {
        title,
        content: editor?.getHTML() || "",
        summary: summary || null,
        thumbnail: thumbnailUrl,
        status: isDraft ? "DRAFT" : "PUBLISHED",
      };

      console.log(
        `${isDraft ? "임시저장" : "발행하기"} 요청 데이터:`,
        jsonData,
      );

      // 통합 API 엔드포인트 사용 (새 방식)
      const response = await axios.post(
        "http://localhost:8080/api/admin/newsletters/save",
        jsonData,
        { params: { mode: isDraft ? "draft" : "publish" } },
      );

      // 또는 기존 엔드포인트 계속 사용 (하위 호환성)
      // const response = await axios.post(
      //     isDraft
      //         ? 'http://localhost:8080/api/admin/newsletters/save-draft'
      //         : 'http://localhost:8080/api/admin/newsletters/create-json',
      //     jsonData
      // );

      console.log("응답:", response.data);
      setSuccess(true);

      // 3초 후 목록 페이지로 이동
      setTimeout(() => {
        router.push("/admin/newsletters");
      }, 3000);
    } catch (err) {
      console.error(`${isDraft ? "임시저장" : "발행"} 중 오류:`, err);
      setError(
        `뉴스레터 ${isDraft ? "임시저장" : "발행"} 중 오류가 발생했습니다.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/newsletters")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <h1 className="text-2xl font-bold">새 뉴스레터 작성</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            임시저장
          </Button>

          <Button onClick={(e) => handleSubmit(e)} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            발행하기
          </Button>
        </div>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>
            뉴스레터가 성공적으로 저장되었습니다. 곧 목록 페이지로 이동합니다.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 메인 컨텐츠 영역 */}
        <div className="md:col-span-3">
          <Card className="mb-6">
            <Tabs
              defaultValue="edit"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">
                    <FileText className="h-4 w-4 mr-2" />
                    편집
                  </TabsTrigger>
                  <TabsTrigger value="preview" onClick={handlePreviewMode}>
                    <Eye className="h-4 w-4 mr-2" />
                    미리보기
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="edit" className="mt-0">
                  <div className="mb-4">
                    <Label htmlFor="title">뉴스레터 제목</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                      className="mt-1.5"
                    />
                  </div>

                  {editor && (
                    <div className="border rounded-md overflow-hidden">
                      {/* 에디터 툴바 */}
                      <div className="bg-slate-50 p-2 border-b flex flex-wrap gap-1 items-center">
                        <TooltipProvider>
                          {/* 서식 도구 */}
                          <div className="flex gap-1 mr-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("bold")}
                                  onPressedChange={() =>
                                    editor.chain().focus().toggleBold().run()
                                  }
                                  aria-label="Bold"
                                >
                                  <Bold className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>굵게</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("italic")}
                                  onPressedChange={() =>
                                    editor.chain().focus().toggleItalic().run()
                                  }
                                  aria-label="Italic"
                                >
                                  <Italic className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>기울임</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("underline")}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleUnderline()
                                      .run()
                                  }
                                  aria-label="Underline"
                                >
                                  <UnderlineIcon className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>밑줄</TooltipContent>
                            </Tooltip>
                          </div>

                          <Separator
                            orientation="vertical"
                            className="h-6 mx-1"
                          />

                          {/* 제목 도구 */}
                          <div className="flex gap-1 mr-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("heading", {
                                    level: 1,
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleHeading({ level: 1 })
                                      .run()
                                  }
                                  aria-label="Heading 1"
                                >
                                  <Heading1 className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>큰 제목</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("heading", {
                                    level: 2,
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleHeading({ level: 2 })
                                      .run()
                                  }
                                  aria-label="Heading 2"
                                >
                                  <Heading2 className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>중간 제목</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("heading", {
                                    level: 3,
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleHeading({ level: 3 })
                                      .run()
                                  }
                                  aria-label="Heading 3"
                                >
                                  <Heading3 className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>작은 제목</TooltipContent>
                            </Tooltip>
                          </div>

                          <Separator
                            orientation="vertical"
                            className="h-6 mx-1"
                          />

                          {/* 정렬 도구 */}
                          <div className="flex gap-1 mr-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive({
                                    textAlign: "left",
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .setTextAlign("left")
                                      .run()
                                  }
                                  aria-label="Align left"
                                >
                                  <AlignLeft className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>왼쪽 정렬</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive({
                                    textAlign: "center",
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .setTextAlign("center")
                                      .run()
                                  }
                                  aria-label="Align center"
                                >
                                  <AlignCenter className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>가운데 정렬</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive({
                                    textAlign: "right",
                                  })}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .setTextAlign("right")
                                      .run()
                                  }
                                  aria-label="Align right"
                                >
                                  <AlignRight className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>오른쪽 정렬</TooltipContent>
                            </Tooltip>
                          </div>

                          <Separator
                            orientation="vertical"
                            className="h-6 mx-1"
                          />

                          {/* 목록 도구 */}
                          <div className="flex gap-1 mr-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("bulletList")}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleBulletList()
                                      .run()
                                  }
                                  aria-label="Bullet list"
                                >
                                  <List className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>글머리 기호</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("orderedList")}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleOrderedList()
                                      .run()
                                  }
                                  aria-label="Ordered list"
                                >
                                  <ListOrdered className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>번호 매기기</TooltipContent>
                            </Tooltip>
                          </div>

                          <Separator
                            orientation="vertical"
                            className="h-6 mx-1"
                          />

                          {/* 특수 요소 도구 */}
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("blockquote")}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleBlockquote()
                                      .run()
                                  }
                                  aria-label="Blockquote"
                                >
                                  <Quote className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>인용구</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Toggle
                                  size="sm"
                                  pressed={editor.isActive("codeBlock")}
                                  onPressedChange={() =>
                                    editor
                                      .chain()
                                      .focus()
                                      .toggleCodeBlock()
                                      .run()
                                  }
                                  aria-label="Code Block"
                                >
                                  <Code className="h-4 w-4" />
                                </Toggle>
                              </TooltipTrigger>
                              <TooltipContent>코드 블록</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={insertLink}
                                  aria-label="Insert link"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>링크 삽입</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={insertImage}
                                  aria-label="Insert image"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>이미지 삽입</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={insertYoutube}
                                  aria-label="Insert YouTube video"
                                >
                                  <YoutubeIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                유튜브 비디오 삽입
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>

                      {/* 에디터 본문 */}
                      <EditorContent
                        editor={editor}
                        className="prose max-w-none p-4 min-h-[500px] focus:outline-none focus:ring-0"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-md p-6">
                    <h1 className="text-2xl font-bold mb-4">
                      {title || "제목 없음"}
                    </h1>
                    <div ref={previewRef} className="prose max-w-none" />
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* 오른쪽 사이드바 - 옵션 패널 */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>뉴스레터 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 썸네일 이미지 섹션 */}
              <div>
                <Label htmlFor="thumbnail">썸네일 이미지</Label>
                <div
                  className="mt-1.5 border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        className="max-h-40 mx-auto rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailImg(null);
                          setThumbnailPreview(null);
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                      <p>클릭하여 이미지 업로드</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="thumbnail"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </div>
              </div>

              {/* 요약 섹션 */}
              <div>
                <Label htmlFor="summary">뉴스레터 요약</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="뉴스레터의 간략한 요약을 입력하세요"
                  className="mt-1.5"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  요약은 미리보기와 검색 결과에 표시됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateNewsletter;
