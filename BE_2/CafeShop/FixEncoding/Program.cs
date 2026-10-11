using System;
using System.IO;
using System.Text;
using System.Linq;

namespace FixEncoding
{
    class Program
    {
        static void Main(string[] args)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            Encoding win1252 = Encoding.GetEncoding(1252);
            Encoding utf8 = new UTF8Encoding(false);

            string[] directories = new[]
            {
                @"d:\hoc tap\PTPMMNM\BE_2\CafeShop\CafeShop.Service",
                @"d:\hoc tap\PTPMMNM\BE_2\CafeShop\CafeShop"
            };

            foreach (var dir in directories)
            {
                var files = Directory.GetFiles(dir, "*.cs", SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    string content = File.ReadAllText(file, utf8);
                    
                    // Check if it has mojibake (like Ă, Ä, Æ, á, etc.)
                    if (content.Contains("Ă") || content.Contains("Ä") || content.Contains("Æ") || content.Contains("á»") || content.Contains("áº") || content.Contains("Ăª") || content.Contains("Ă³") || content.Contains("Ã"))
                    {
                        try
                        {
                            byte[] bytes = win1252.GetBytes(content);
                            string fixedContent = utf8.GetString(bytes);
                            
                            // Only write if it successfully decoded back to something without 
                            if (!fixedContent.Contains(""))
                            {
                                File.WriteAllText(file, fixedContent, utf8);
                                Console.WriteLine("Fixed: " + file);
                            }
                        }
                        catch (Exception)
                        {
                            // Skip on error
                        }
                    }
                }
            }
        }
    }
}
