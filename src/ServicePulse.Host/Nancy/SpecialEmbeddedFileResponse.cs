﻿namespace ServicePulse.Host.Nancy
{
    using System;
    using System.IO;
    using System.Reflection;
    using System.Security.Cryptography;
    using System.Text;
    using global::Nancy;

    public class SpecialEmbeddedFileResponse : Response
    {
        public SpecialEmbeddedFileResponse(Assembly assembly, string resourcePath)
        {
            ContentType = MimeTypes.GetMimeType(Path.GetFileName(resourcePath));
            StatusCode = HttpStatusCode.OK;

            var content = assembly.GetManifestResourceStream(resourcePath);
            
            if (content == null)
            {
                StatusCode = HttpStatusCode.NotFound;
                return;
            }

            this.WithHeader("ETag", GenerateETag(content));
            Contents = GetFileContent(content);
        }

        private static Action<Stream> GetFileContent(Stream content)
        {
            return stream =>
            {
                using (content)
                {
                    content.Seek(0, SeekOrigin.Begin);
                    content.CopyTo(stream);
                }
            };
        }

        private static string GenerateETag(Stream stream)
        {
            using (var md5 = MD5.Create())
            {
                var hash = md5.ComputeHash(stream);
                return string.Concat("\"", ByteArrayToString(hash), "\"");
            }
        }

        private static string ByteArrayToString(byte[] data)
        {
            var output = new StringBuilder(data.Length);
            foreach (var b in data)
            {
                output.Append(b.ToString("X2"));
            }

            return output.ToString();
        }
    }
}