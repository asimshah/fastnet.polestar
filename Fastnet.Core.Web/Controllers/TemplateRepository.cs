using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Controllers
{
    public class TemplateRepository : ITemplateRepository
    {
        private readonly IHostingEnvironment env;
        private Dictionary<string, TemplateHelper> helpers = new Dictionary<string, TemplateHelper>();
        private class TemplateHelper
        {
            private string area;
            private Dictionary<string, string> templates = new Dictionary<string, string>();
            public TemplateHelper(string area)
            {
                this.area = area;
            }
            public void Load(IHostingEnvironment env)
            {
                ScanForTemplates(env, "Templates");
            }

            private void ScanForTemplates(IHostingEnvironment env, string templateFolder)
            {
                string path = "";
                if (!string.IsNullOrWhiteSpace(area))
                {
                    path = $"{area}";
                }
                var rootFolder = env.WebRootPath;// Path.Combine(env.MapPath(path));
                var templateDirectory = new DirectoryInfo(Path.Combine(rootFolder, templateFolder));
                if (templateDirectory.Exists)
                {
                    var rootDirectory = new DirectoryInfo(rootFolder);
                    var templatePartCount = templateDirectory.FullName.Split('\\').Length;
                    var files = templateDirectory.EnumerateFiles("*.html", SearchOption.AllDirectories);
                    foreach (FileInfo fi in files)
                    {
                        var templateName = Path.GetFileNameWithoutExtension(fi.Name).ToLower();
                        string[] parts = Path.GetDirectoryName(fi.FullName).Split('\\');
                        var t = string.Join("-", parts.Skip(templatePartCount).ToArray()).ToLower();
                        string name = templateName;
                        if (t.Length > 0)
                        {
                            name = $"{t}-{templateName}";
                        }
                        templates.Add(name, fi.FullName);
                    }
                }
            }

            public string GetTemplate(string name)
            {
                name = name.ToLower();
                if (templates.ContainsKey(name))
                {
                    return templates[name];
                }
                return null;
            }
        }
        public TemplateRepository(IHostingEnvironment env)
        {
            this.env = env;
        }
        public ITemplate GetTemplate(string name, string area = "")
        {
            var fn = GetTemplateFilename(name, area);
            if (fn != null)
            {

                var file = new FileInfo(fn);
                var text = File.ReadAllText(file.FullName);
                return new Template(text, file.LastWriteTime);
            }
            else
            {
                return null;
            }
        }
        private string GetTemplateFilename(string name, string area = "")
        {
            var th = GetHelper(area);
            return th.GetTemplate(name);

        }
        private TemplateHelper GetHelper(string area)
        {
            area = area.ToLower();
            if (!helpers.ContainsKey(area))
            {
                lock (helpers)
                {
                    if (!helpers.ContainsKey(area))
                    {
                        var helper = new TemplateHelper(area);
                        helper.Load(this.env);
                        helpers[area] = helper;
                    }
                }
            }
            return helpers[area];
        }
    }
}
