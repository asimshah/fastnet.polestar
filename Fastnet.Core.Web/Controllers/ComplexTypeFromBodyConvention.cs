using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Fastnet.Core.Web.Controllers
{
    public class ComplexTypeFromBodyConvention : IActionModelConvention
    {
        public void Apply(ActionModel action)
        {
            foreach (var parameter in action.Parameters)
            {
                var paramType = parameter.ParameterInfo.ParameterType;
                if (parameter.BindingInfo == null && (IsSimpleType(paramType) || IsSimpleUnderlyingType(paramType)) == false)
                {
                    parameter.BindingInfo = new BindingInfo
                    {
                        BindingSource = BindingSource.Body
                    };
                }
            }
        }
        private static bool IsSimpleType(Type type)
        {
            // replace type.IsPrimitive with  type.GetTypeInfo().IsPrimitive, if dnxcore50
            return type.GetTypeInfo().IsPrimitive ||
               type.Equals(typeof(string)) ||
               type.Equals(typeof(DateTime)) ||
               type.Equals(typeof(Decimal)) ||
               type.Equals(typeof(Guid)) ||
               type.Equals(typeof(DateTimeOffset)) ||
               type.Equals(typeof(TimeSpan));
        }

        private static bool IsSimpleUnderlyingType(Type type)
        {
            Type underlyingType = Nullable.GetUnderlyingType(type);
            if (underlyingType != null)
            {
                type = underlyingType;
            }

            return IsSimpleType(type);
        }
    }
}
